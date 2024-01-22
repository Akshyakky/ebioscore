// utils/extractNumbers.js
const extractNumbers = (inputString: string, pattern = /(\d+)/) => {
  const matches = inputString.match(pattern);
  return matches ? matches.map(Number) : [];
};

export default extractNumbers;
