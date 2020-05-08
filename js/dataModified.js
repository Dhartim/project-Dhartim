function convertRow(row, index)
{
  let out = {};
  for(let col in row)
  {
    switch (col) {
      case "Country":
      case "CountryCode":
      case "Region":
      case "name" :
      case "category":
        out[col] = row[col];
        break;
      default:
        out[col] = parseFloat(row[col].replace(/,/g, ''));
        break;
    }
  }
  return out;
}
