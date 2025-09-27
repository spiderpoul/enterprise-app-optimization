declare module 'webpack-bundle-analyzer' {
  import type { Compiler, WebpackPluginInstance } from 'webpack';

  export interface BundleAnalyzerPluginOptions {
    analyzerMode?: 'server' | 'static' | 'disabled';
    analyzerHost?: string;
    analyzerPort?: number | 'auto';
    reportFilename?: string;
    defaultSizes?: 'stat' | 'parsed' | 'gzip';
    openAnalyzer?: boolean;
    generateStatsFile?: boolean;
    statsFilename?: string;
    statsOptions?: object;
    logLevel?: 'info' | 'warn' | 'error' | 'silent';
  }

  export class BundleAnalyzerPlugin implements WebpackPluginInstance {
    constructor(options?: BundleAnalyzerPluginOptions);
    apply(compiler: Compiler): void;
  }
}
