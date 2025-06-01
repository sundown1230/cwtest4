// functions/hello.js
export async function onRequest(context) {
  // context object contains information about the request
  // context.request: The Request object
  // context.env: Environment variables
  // context.params: Matched dynamic path segments
  // context.waitUntil: For extending the lifetime of the request
  // context.next: For calling the next function in a chain
  // context.data: Arbitrary data passed from middleware

  return new Response("Hello from Functions!");
}
