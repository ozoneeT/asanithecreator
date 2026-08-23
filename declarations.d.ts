declare module "*.png" {
    const value: any;
    export = value;
}

declare module "*.PNG" {
    const value: any;
    export = value;
}

declare module "*.webp" {
    const value: any;
    export = value;
}

interface ImportMetaEnv {
    readonly VITE_R2_PUBLIC_HOST?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
