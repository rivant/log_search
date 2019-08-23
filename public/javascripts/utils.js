const duplicates = (currentValue, index, array) => array.indexOf(currentValue) === index;
const today = newDate => newDate.toJSON().split('T')[0];
const randomPortNumber = () => Math.floor(Math.random() * (65000 - 60000 + 1)) + 60000;
const parse = jsonArray => {
  let newObject = {};
  
  locations.forEach(line => {
    let entry = JSON.parse(line);
    newObject[entry.value] = entry.text.split(' ')[0].toLowerCase();
  });
  
  return newObject;
}