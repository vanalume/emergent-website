/**
 * CategoryCard — a clickable card for the Shop "All" rail. It is a <button>,
 * not a <Link>, because it switches the in-page pane (Shop's activeGroup)
 * rather than navigating to another route.
 *
 * The image is the first product shown for the category; categories without an
 * in-stock product fall back to a neutral panel.
 */
export default function CategoryCard({ category, onSelect, className = "" }) {
  const { id, title, count, image } = category;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      data-testid={`category-card-${id}`}
      className={`group block text-left ${className}`}
    >
      <div className="relative overflow-hidden rounded-sm bg-[#ece3d4] aspect-[4/5]">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center px-4 text-center">
            <span className="font-display text-2xl text-[#2b2320]/40">{title}</span>
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-[#5c3e2b]/12" />
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display fs-product_card_name leading-tight group-hover:text-[#5c3e2b] transition-colors">{title}</h3>
        <span className="shrink-0 text-xs tracking-[0.16em] uppercase text-[#5c3e2b]/70">
          {`${count} ${count === 1 ? "item" : "items"}`}
        </span>
      </div>
    </button>
  );
}
