#!/usr/bin/env bash
# Прогоняет один eval-кейс N раз, каждый раз в чистом git worktree, и оценивает каждый прогон.
#
#   EVAL_AGENT_CMD='<команда, которая запускает агента>' evals/run-case.sh <кейс> [прогонов]   (по умолчанию 5)
#
# Агент получает ТОЛЬКО текст раздела «Задача»: в stdin, в $EVAL_TASK и в файле $EVAL_TASK_FILE.
# EVAL_AGENT_CMD запускается внутри worktree; его stdout сохраняется как отчёт агента
# (если агент написал agent-report.md в корне worktree, grader читает и его).
#
# Необязательные переменные:
#   EVAL_REF          коммит, с которого начинать вместо «Стартового коммита» кейса,
#                     например EVAL_REF=HEAD для колонки «После (этот MR)» в шаблоне PR
#   EVAL_SETUP_CMD    выполняется в каждом worktree до агента (по умолчанию npm ci --no-audit --no-fund)
#   EVAL_TIMEOUT      секунд на один прогон агента (по умолчанию 3600)
#   EVAL_LABEL        произвольный текст к каждому результату, например модель и настройки
#   EVAL_GRADER_ARGS  доп. аргументы grader, например "--skip bundle" при отладке (такой прогон не засчитывается)
#   EVAL_KEEP=1       не удалять worktree, чтобы посмотреть руками
#
# Результат: по строке JSON на прогон в evals/results/<дата>-<кейс>.jsonl, отчёт и логи агента
# в evals/results/<дата>-<кейс>/ и в конце строка «прошло k из N».
set -euo pipefail

usage() {
  sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
}

[ $# -ge 1 ] || usage
case "$1" in -h | --help) usage ;; esac
case_name=$1
runs=${2:-5}
[[ $runs =~ ^[1-9][0-9]*$ ]] || { echo "Число прогонов должно быть целым положительным, получено '$runs'" >&2; exit 2; }

repo_root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
case_file="$repo_root/evals/cases/$case_name.md"
grader="$repo_root/evals/graders/$case_name.cjs"
[ -f "$case_file" ] || { echo "Нет кейса: $case_file" >&2; exit 2; }
[ -f "$grader" ] || { echo "Для '$case_name' нет grader ($grader): оценивай этот кейс руками." >&2; exit 2; }
[ -n "${EVAL_AGENT_CMD:-}" ] || { echo "Задай EVAL_AGENT_CMD — команду, которая запускает агента без диалога." >&2; exit 2; }

start=$(sed -n 's/^Стартовый коммит:[[:space:]]*\([0-9a-fA-F]\{7,40\}\).*/\1/p' "$case_file" | head -n 1)
ref=${EVAL_REF:-$start}
[ -n "$ref" ] || { echo "В $case_file нет строки «Стартовый коммит:», и EVAL_REF не задан" >&2; exit 2; }
base=$(git -C "$repo_root" rev-parse --verify --quiet "$ref^{commit}") ||
  { echo "Неизвестный коммит '$ref'. Сначала загрузи его (git fetch origin)." >&2; exit 2; }

# Агенту уходит только раздел «Задача»: текст под «## Задача» до следующего заголовка.
task=$(node -e '
  const lines = require("fs").readFileSync(process.argv[1], "utf8").split("\n");
  const start = lines.findIndex((line) => /^## Задача(\s|$)/.test(line));
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  process.stdout.write(start < 0 ? "" : lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim());
' "$case_file")
[ -n "$task" ] || { echo "Пустой раздел «Задача» в $case_file" >&2; exit 2; }

results="$repo_root/evals/results"
stamp=$(date +%F)
jsonl="$results/$stamp-$case_name.jsonl"
out_dir="$results/$stamp-$case_name"
mkdir -p "$out_dir"
work_root=$(mktemp -d "${TMPDIR:-/tmp}/eval-$case_name-XXXXXX")
worktrees=()

cleanup() {
  if [ "${EVAL_KEEP:-0}" = 1 ]; then
    echo "Worktree оставлены в $work_root" >&2
    return
  fi
  for wt in ${worktrees[@]+"${worktrees[@]}"}; do
    git -C "$repo_root" worktree remove --force "$wt" 2>/dev/null || true
  done
  rm -rf "$work_root"
}
trap cleanup EXIT

run_with_timeout() {
  if command -v timeout >/dev/null 2>&1; then timeout "${EVAL_TIMEOUT:-3600}" "$@"; else "$@"; fi
}

passed=0
for i in $(seq 1 "$runs"); do
  run_dir="$out_dir/run-$i-$(date +%H%M%S)"
  wt="$work_root/run-$i"
  mkdir -p "$run_dir"
  printf '%s\n' "$task" >"$run_dir/task.md"
  echo "[$case_name] прогон $i/$runs с ${base:0:7} в $wt" >&2

  git -C "$repo_root" worktree add --detach --quiet "$wt" "$base"
  worktrees+=("$wt")
  # Если стартовый коммит содержит evals/, агент увидел бы критерии и grader: прячем их.
  if [ -d "$wt/evals" ]; then
    git -C "$wt" ls-files -z -- evals | xargs -0 git -C "$wt" update-index --skip-worktree --
    rm -rf "$wt/evals"
  fi

  agent_exit=""
  seconds=0
  if ! (cd "$wt" && eval "${EVAL_SETUP_CMD:-npm ci --no-audit --no-fund}") >"$run_dir/setup.log" 2>&1; then
    line="{\"case\":\"$case_name\",\"pass\":false,\"failed\":[\"setup\"]}"
  else
    started=$(date +%s)
    set +e
    (cd "$wt" && export EVAL_TASK="$task" EVAL_TASK_FILE="$run_dir/task.md" &&
      run_with_timeout bash -c "$EVAL_AGENT_CMD") <"$run_dir/task.md" >"$run_dir/report.md" 2>"$run_dir/agent.log"
    agent_exit=$?
    set -e
    seconds=$(($(date +%s) - started))
    # shellcheck disable=SC2086 # EVAL_GRADER_ARGS is a list of arguments
    line=$(EVAL_LOG_DIR="$run_dir" node "$grader" --worktree "$wt" --base "$base" \
      --report "$run_dir/report.md" ${EVAL_GRADER_ARGS:-} 2>"$run_dir/grader.log" | tail -n 1) || true
    [ -n "$line" ] || line="{\"case\":\"$case_name\",\"pass\":false,\"failed\":[\"grader-error\"]}"
  fi

  node -e '
    const [line, run, ref, commit, agentExit, seconds, label, dir] = process.argv.slice(1);
    const result = JSON.parse(line);
    Object.assign(result, {
      run: Number(run), ref, commit, agentExit: agentExit === "" ? null : Number(agentExit),
      seconds: Number(seconds), label: label || undefined, dir, at: new Date().toISOString(),
    });
    process.stdout.write(JSON.stringify(result) + "\n");
  ' "$line" "$i" "$ref" "$base" "$agent_exit" "$seconds" "${EVAL_LABEL:-}" "${run_dir#"$repo_root"/}" >>"$jsonl"

  if node -e 'process.exit(JSON.parse(process.argv[1]).pass ? 0 : 1)' "$line"; then
    passed=$((passed + 1))
  fi
  echo "[$case_name] прогон $i: $line" >&2
  if [ "${EVAL_KEEP:-0}" != 1 ]; then
    git -C "$repo_root" worktree remove --force "$wt"
  fi
done

echo "Результаты: ${jsonl#"$repo_root"/}"
echo "прошло $passed из $runs"
