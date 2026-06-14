// Build a "Reddit Skeleton." Use Tailwind to create three gray boxes (representing posts) with an animate-pulse class.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4">
      {[1, 2, 3].map((item) => (
        <article
          key={item}
          className="animate-pulse rounded-md border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 h-4 w-1/3 rounded bg-gray-300"></div>
          <div className="mb-2 h-6 w-5/6 rounded bg-gray-300"></div>
          <div className="mb-2 h-4 w-full rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-11/12 rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-2/3 rounded bg-gray-200"></div>
        </article>
      ))}
    </main>
  );
}
