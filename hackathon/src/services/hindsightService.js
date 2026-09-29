const STORAGE_KEY = 'contentmind.hindsight'

export const defaultMemorySeeds = [
  {
    id: 'audience',
    title: 'Your audience',
    detail: 'Your audience responds well to practical tips.',
    basedOn: '6 previous posts',
    confidence: 'High',
    learned: 'September 2026',
    helps: "I'll consider this when suggesting future content.",
    evidence: 'Practical examples outperform broad advice.',
  },
  {
    id: 'content',
    title: 'Your content',
    detail: 'Educational posts are among your strongest performers.',
    basedOn: '9 previous posts',
    confidence: 'High',
    learned: 'September 2026',
    helps: 'I will recommend more educational topics.',
    evidence: 'Short educational posts consistently generate stronger engagement.',
  },
  {
    id: 'style',
    title: 'Your style',
    detail: 'You prefer short, friendly and conversational captions.',
    basedOn: '4 previous posts',
    confidence: 'Medium',
    learned: 'September 2026',
    helps: 'I will use a casual tone in future content.',
    evidence: 'Audience responds best to a relaxed, human voice.',
  },
  {
    id: 'schedule',
    title: 'Your schedule',
    detail: 'You usually post 3 times a week.',
    basedOn: '12 posts',
    confidence: 'High',
    learned: 'September 2026',
    helps: 'I can plan a balanced weekly content cadence.',
    evidence: 'Three consistent posts keeps engagement steady.',
  },
  {
    id: 'interests',
    title: 'Your interests',
    detail: 'You frequently create content around AI and productivity.',
    basedOn: '7 posts',
    confidence: 'High',
    learned: 'September 2026',
    helps: 'I will keep building on the topics your audience already likes.',
    evidence: 'AI workflows and productivity content perform well together.',
  },
]

export const getStoredMemories = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return defaultMemorySeeds
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultMemorySeeds
  } catch (error) {
    return defaultMemorySeeds
  }
}

export const persistMemories = (records) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    // fail gracefully without breaking the app experience
  }
}

export const hindsightService = {
  retainMemory(records, newMemory) {
    const nextRecords = [...records]
    const existingIndex = nextRecords.findIndex((item) => item.id === newMemory.id)

    if (existingIndex !== -1) {
      const updated = { ...nextRecords[existingIndex], ...newMemory }
      nextRecords.splice(existingIndex, 1, updated)
      persistMemories(nextRecords)
      return nextRecords
    }

    const merged = [newMemory, ...nextRecords]
    persistMemories(merged)
    return merged
  },

  recallMemory(records, query) {
    if (!query) return records[0] ?? null

    const normalized = query.toLowerCase()
    return records.find((item) => item.title.toLowerCase().includes(normalized)) ?? null
  },

  searchMemories(records, term) {
    if (!term) return records

    const normalized = term.toLowerCase()
    return records.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalized))
  },

  getRelevantMemories(records) {
    return records.slice(0, 3)
  },
}
