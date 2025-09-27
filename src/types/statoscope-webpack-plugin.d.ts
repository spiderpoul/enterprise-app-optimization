declare module '@statoscope/webpack-plugin' {
  import type { Compiler, WebpackPluginInstance } from 'webpack';

  export interface StatoscopePluginOptions {
    name?: string;
    saveOnlyStats?: boolean;
    saveStatsTo?: string | string[];
    statsOptions?: object;
    watchMode?: boolean;
  }

  export default class StatoscopeWebpackPlugin implements WebpackPluginInstance {
    constructor(options?: StatoscopePluginOptions);
    apply(compiler: Compiler): void;
  }
}
