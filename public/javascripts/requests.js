async function getAdapterList(api, address, port) {
  const jsonData = await fetch('https://'+ address +':'+ port +'/'+ api).then(response => response.json());
  return jsonData;
}