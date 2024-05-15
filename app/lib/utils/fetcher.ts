const simpleJSONFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (r.ok) return r.json();
  });

export default simpleJSONFetcher;
