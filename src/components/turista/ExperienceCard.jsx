import { Link } from 'react-router-dom';

export default function ExperienceCard({ experience, to, onRemoveFavorite }) {
  const { title, location, rating, meta, price, spots, image } = experience;

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-[#DFE8EB] bg-white">
      <img src={image} alt="" loading="lazy" className="h-48 w-full object-cover sm:h-[220px]" />
      <div className="flex flex-col gap-2.5 p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] leading-[1.45] text-[#637780]">{location}</p>
          <p className="shrink-0 text-[13px] font-semibold text-[#102F3B]">★ {rating.toFixed(1)}</p>
        </div>
        <h3 className="text-[18px] font-bold leading-[1.3] text-[#102F3B] sm:text-[19px]">
          {to ? (
            <Link to={to} className="hover:text-[#087E9A]">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <p className="text-[13px] leading-[1.45] text-[#637780]">{meta}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-bold text-[#102F3B]">
            ${price} USD <span className="text-[12px] font-normal text-[#637780]">/ persona</span>
          </p>
          <span className="rounded-full bg-[#E9F5F7] px-2.5 py-1.5 text-[12px] font-semibold text-[#637780]">
            {spots} cupos
          </span>
        </div>
      </div>
      {onRemoveFavorite && (
        <button
          type="button"
          onClick={() => onRemoveFavorite(experience.id)}
          aria-label={`Quitar «${title}» de favoritos`}
          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white text-[18px] font-bold text-[#087E9A] shadow-sm hover:bg-[#E9F5F7]"
        >
          ♥
        </button>
      )}
    </article>
  );
}
