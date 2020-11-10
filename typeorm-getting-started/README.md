How to create this project from scratch
```bash
npm init -y
npm install -D typescript
npm install typeorm --save
npm install reflect-metadata --save
npm install @types/node --save-dev
npm install ts-node --save-dev
npm install mysql --save
npx tsc --init // create tsconfig.json

```
Use `ts-node src/index.ts` in the npm script (do not use `tsc && node dist/index.js`)