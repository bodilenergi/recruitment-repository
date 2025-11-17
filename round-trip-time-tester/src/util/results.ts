export const formatResponseTimeResults = (results: number[]) => ({
  min: Math.min(...results),
  max: Math.max(...results),
  average: results.reduce((sum, value) => sum + value, 0) / results.length,
});
