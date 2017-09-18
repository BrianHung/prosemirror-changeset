// ::- A document range with an author assigned to it. Used to track
// both inserted and deleted ranges internally, but only the inserted
// ranges are returned as spans.
export class Span {
  constructor(from, to, data) {
    // :: number
    this.from = from
    // :: number
    this.to = to
    // :: any
    this.data = data
  }
}

// :: ([Span], number, number, string) → [Span]
// Updates an array of spans by adding a new one to it. Spans with
// different authors are kept separate. When the new span touches
// spans with the same author, it is joined with them. When it
// overlaps with spans with different authors, it overwrites those
// parts.
export function addSpan(spans, from, to, data, compare, combine) {
  return addSpanInner(spans, from, to, data, compare, combine, true)
}

export function addSpanBelow(spans, from, to, data, compare, combine) {
  return addSpanInner(spans, from, to, data, compare, combine, false)
}

export function addSpanInner(spans, from, to, data, compare, combine, above) {
  let result = [], insert = 0

  for (let i = 0; i < spans.length; i++) {
    let span = spans[i]
    if (span.from > to || span.to < from) {
      result.push(span)
      if (span.to < from) insert = result.length
    } else if (compare(span.data, data)) {
      from = Math.min(from, span.from)
      to = Math.max(to, span.to)
      data = combine(span.data, data)
      insert = result.length
    } else if (above) {
      if (span.from < from) result.push(span.to == from ? span : new Span(span.from, from, span.data))
      insert = result.length
      if (span.to > to) result.push(span.from == to ? span : new Span(to, span.to, span.data))
    } else {
      if (from < span.from) result.push(new Span(from, span.from, data))
      result.push(span)
      insert = result.length
      if (to > span.to) from = span.to
      else to = -1
    }
  }
  if (to > -1) result.splice(insert, 0, new Span(from, to, data))
  return result
}
