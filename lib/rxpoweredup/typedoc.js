/** @type {Partial<import("typedoc").TypeDocOptions>} */
const CONFIG = {
    entryPoints: [
        './src/index.ts'
    ],
    out: '../../docs',
    readme: './README.md',
    gitRevision: 'main',
};
export default CONFIG;
