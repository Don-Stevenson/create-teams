export default function Footer() {
  return (
    <div className="text-center items-center text-xs p-4 print:hidden">
      © {new Date(Date.now()).getFullYear().toString()} Loons Team Balancer. All
      rights reserved.
    </div>
  )
}
