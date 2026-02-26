import { Fragment } from "react"

/**
 * Renders a string with newline characters as visible line breaks.
 * Splits on \n and inserts <br /> elements between lines.
 *
 * Usage: {renderWithLineBreaks(card.title || "Default")}
 */
export function renderWithLineBreaks(text: string) {
  const lines = text.split("\n")
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ))
}
