const strapiApiToken = process.env.STRAPI_API_TOKEN;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!strapiApiToken) {
  throw new Error("STRAPI_API_TOKEN is not defined");
}

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}
const page = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <p className="text-lg">
        STRAPI_API_TOKEN:{" "}
        <span className="font-mono text-blue-600">{strapiApiToken}</span>
      </p>
      <p className="text-lg">
        NEXT_PUBLIC_API_URL:{" "}
        <span className="font-mono text-blue-600">{apiUrl}</span>
      </p>
    </div>
  );
};

export default page;
