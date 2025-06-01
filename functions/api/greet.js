// functions/api/greet.js
export const onRequestGet = async (context) => {
  const url = new URL(context.request.url);
  const name = url.searchParams.get("name") || "World";
  return new Response(`Hello, ${name}! This is a GET request.`);
};

export const onRequestPost = async (context) => {
  try {
    const data = await context.request.json();
    return new Response(`Hello, ${data.name}! This is a POST request. You sent: ${JSON.stringify(data)}`, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response('Invalid JSON body', { status: 400 });
  }
};
