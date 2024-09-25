export default function LogoList() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-12 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:grid-cols-4">
      <img
        className="col-span-2 max-h-64 w-full object-contain lg:col-span-1"
        src="/pic/ffu.png"
        alt="Transistor"
        width={158}
        height={48}
      />
      <img
        className="col-span-2 max-h-48 w-full object-contain lg:col-span-1"
        src="/pic/hopstart.png"
        alt="Reform"
        width={158}
        height={48}
      />
      <img
        className="col-span-2 max-h-48 w-full object-contain lg:col-span-1"
        src="/pic/jhu_logo.png"
        alt="Tuple"
        width={158}
        height={48}
      />
      <img
        className="col-span-2 max-h-48 w-full object-contain sm:col-start-2 lg:col-span-1"
        src="/pic/jhu_peabody.png"
        alt="SavvyCal"
        width={158}
        height={48}
      />
      {/* <img
        className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
        src="https://tailwindui.com/img/logos/158x48/statamic-logo-gray-400.svg"
        alt="Statamic"
        width={158}
        height={48}
      /> */}
    </div>
  </div>
  )
}
