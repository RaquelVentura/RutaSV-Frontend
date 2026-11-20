export default function SectionTitle({ eyebrow, title, children, center = false }) {
  return (
    <div className={`flex flex-col gap-3 ${center ? 'items-center text-center' : ''}`}>
      <p className="text-[12px] font-bold uppercase leading-[1.45] text-[#087E9A]">{eyebrow}</p>
      <h2 className="text-2xl font-bold leading-[1.2] text-[#102F3B] sm:text-[30px]">{title}</h2>
      {children}
    </div>
  );
}
