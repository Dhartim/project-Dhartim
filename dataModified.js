function convertRow(row, index)
{
  let out = {};
  for(let col in row)
  {
    switch (col) {
      case "Country":
      case "CountryCode":
      case "Region":
        out[col] = row[col];
        break;
      default:
        out[col] = parseInt(row[col]);
        break;
    }
  }
  return out;
}
