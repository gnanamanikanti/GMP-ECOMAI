import shopbotMascot from "../assets/shopbot-mascot.png";

/**
 * ShopBot mascot — PNG with layout variants so it reads well at any size.
 * - inline: nav / buttons (square tile, soft shadow)
 * - avatar: chat bubbles (portrait frame, not a tight circle crop)
 * - panel: compact header in the floating chat
 * - hero: large card on /askai
 * - fab: floating action button chip
 */
export default function ShopBotIcon({
  variant = "inline",
  size = 24,
  className = "",
  title = "ShopBot",
}) {
  const imgProps = {
    src: shopbotMascot,
    alt: "",
    className: "shop-bot-wrap__img",
    decoding: "async",
    loading: "lazy",
    draggable: false,
    "aria-hidden": true,
  };

  if (variant === "inline") {
    return (
      <span
        className={`shop-bot-wrap shop-bot-wrap--inline ${className}`.trim()}
        style={{ width: size, height: size }}
        title={title}
      >
        <img {...imgProps} width={size} height={size} />
      </span>
    );
  }

  return (
    <span className={`shop-bot-wrap shop-bot-wrap--${variant} ${className}`.trim()} title={title}>
      <img {...imgProps} />
    </span>
  );
}
