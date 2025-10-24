export default function generateAccountNumber() {
  const prefix = "BMS";
  const num = Math.floor(Math.random() * 900000000) + 100000000;
  return `${prefix}${num}`;
}
