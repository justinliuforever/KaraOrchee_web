const stats = [
  { id: 1, name: 'SOM Users who engage in Classical music willing to pay $100/year', value: '800,000' },
  { id: 2, name: 'Total Market Opportunity', value: '$200 Million' },
  // { id: 3, name: 'Al Integrated Online Community', value: 'Revolutionizing Lifestyle' },
  // { id: 4, name: 'Paid out to creators', value: '$70M' },
]

export default function Statistics() {
  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32 mt-32 sm:mt-56">
      <img
        src="pic/background_piano.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/60 to-black opacity-90"></div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div
          className="absolute -bottom-8 -left-96 -z-10 transform-gpu blur-3xl sm:-bottom-64 sm:-left-40 lg:-bottom-32 lg:left-8 xl:-left-10"
          aria-hidden="true"
        >
        </div>
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
          <h2 className="text-base font-semibold leading-8 text-indigo-400">Base our search</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Karaorchee
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Your Orchestra, Anywhere, Anytime
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 text-white sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col gap-y-3 border-l border-white/10 pl-6">
              <dt className="text-sm leading-6">{stat.name}</dt>
              <dd className="order-first text-3xl font-semibold tracking-tight">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
