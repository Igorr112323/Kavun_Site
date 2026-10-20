export function ProseBody({ text }: { text: string }) {
  const blocks = text.split('\n\n').filter(Boolean)
  return (
    <>
      {blocks.map((block, i) => {
        if (block.startsWith('## ')) return <h2 key={i}>{block.slice(3)}</h2>
        if (block.startsWith('### ')) return <h3 key={i}>{block.slice(4)}</h3>
        if (/^-\s/m.test(block) && block.split('\n').every((l) => l.startsWith('- '))) {
          return (
            <ul key={i}>
              {block.split('\n').map((line, j) => (
                <li key={j}>{line.slice(2)}</li>
              ))}
            </ul>
          )
        }
        if (/^\d+\.\s/m.test(block)) {
          return (
            <ol key={i} style={{ paddingLeft: 22, margin: '0 0 1.2em' }}>
              {block.split('\n').map((line, j) => (
                <li key={j}>{line.replace(/^\d+\.\s/, '')}</li>
              ))}
            </ol>
          )
        }
        return <p key={i}>{block}</p>
      })}
    </>
  )
}
