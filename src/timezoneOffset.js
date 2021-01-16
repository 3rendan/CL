function stringDateConvertLocalTimezone(stringDate){
  let date = new Date(stringDate + 'T00:00:00'); // THIS IS MIDNIGHT LOCAL TIME
  // let date = new Date(stringDate + 'PST');
  return date;
}

export {
  stringDateConvertLocalTimezone
}
