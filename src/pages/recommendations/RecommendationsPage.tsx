import { recommendations } from '@/data/recommendations'
import styles from './RecommendationsPage.module.scss'

function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    return part
  })
}

export function RecommendationsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Инструкции и рекомендации</h1>
        <p className={styles.lead}>
          Практические советы по посадке саженцев из питомника «Саженцы из
          Поповки»: от подготовки ямы до ухода после посадки.
        </p>
      </header>

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Содержание рекомендаций">
          <h2 className={styles.tocTitle}>Содержание</h2>
          <ol className={styles.tocList}>
            {recommendations.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.articles}>
          {recommendations.map((item) => (
            <article key={item.id} id={item.id} className={styles.article}>
              <h2 className={styles.articleTitle}>{item.title}</h2>

              {item.image && (
                <figure className={styles.figure}>
                  <img
                    className={styles.image}
                    src={item.image.src}
                    alt={item.image.alt}
                    loading="lazy"
                  />
                </figure>
              )}

              <div className={styles.text}>
                {item.paragraphs.map((paragraph, index) => (
                  <p key={index}>{renderText(paragraph)}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
