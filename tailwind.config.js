/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // srcフォルダ内の全てのjs, jsx, ts, tsxファイルを対象にする
  ],
  darkMode: 'class', // ダークモードをHTMLのclass属性で制御するための設定
  theme: {
    extend: {
      // もし、以前の gqColors のようなカスタムカラーを
      // Tailwindのクラス名 (例: bg-gq-gold) として直接使いたい場合は、
      // ここで定義できます。例:
      // colors: {
      //   'gq-gold': '#FBBF24',
      //   'gq-red': '#DC2626',
      //   'gq-red-dark': '#B91C1C',
      // },
    },
  },
  plugins: [],
}