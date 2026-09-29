import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { defaultMemorySeeds, getStoredMemories, hindsightService } from './services/hindsightService'

const navItems = [
  { key: 'home', label: '◧ Strategy' },
  { key: 'memory', label: '🧠 Memory' },
  { key: 'create', label: '✨ Studio' },
  { key: 'calendar', label: '▦ Archive' },
  { key: 'results', label: '◉ Showdown' },
  { key: 'ideas', label: '💡 Ideas' },
  { key: 'settings', label: '⚙ Settings' },
]

const businessTypes = [
  '☕ Food & Cafe',
  '👗 Fashion',
  '💄 Beauty',
  '💻 Technology',
  '🏋️ Fitness',
  '🏠 Real Estate',
  '📚 Education',
  '🛍 Retail',
  '🎨 Creator',
  '➕ Other',
]

const defaultDraft = {
  platform: 'Instagram',
  type: 'Caption',
  topic: 'AI workflows for small businesses',
  goal: 'Customers',
}

const PROFILE_STORAGE_KEY = 'contentmind.profile'

const getStoredProfile = () => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function App() {
  const [activeView, setActiveView] = useState('home')
  const [businessProfile, setBusinessProfile] = useState(() => getStoredProfile() ?? {
    industry: '💻 Technology',
    audience: 'Small business owners',
    platforms: ['Instagram', 'LinkedIn'],
    goal: 'Get customers',
  })
  const [onboardingVisible, setOnboardingVisible] = useState(() => !getStoredProfile())
  const [draft, setDraft] = useState(defaultDraft)
  const [memoryEntries, setMemoryEntries] = useState(() => getStoredMemories())
  const [selectedMemory, setSelectedMemory] = useState(() => getStoredMemories()[0] ?? defaultMemorySeeds[0])
  const [chatInput, setChatInput] = useState('What should I post this week?')
  const [memoryStatus, setMemoryStatus] = useState('Using what I’ve learned about your content...')
  const [demoOpen, setDemoOpen] = useState(false)
  const [generatedContent, setGeneratedContent] = useState({
    platform: 'Instagram',
    title: 'Instagram Caption',
    hook: 'Still making these 3 mistakes?',
    caption:
      'Your audience is craving practical ideas they can apply this week. Share one simple workflow, explain the result, and invite them to save this post for later.',
    hashtags: '#AI #SmallBusiness #Productivity #WorkSmarter',
    why: 'Your previous educational posts received more engagement than promotional posts.',
  })
  const [ideas, setIdeas] = useState([
    {
      id: 1,
      title: '5 AI tools that save small businesses hours every week',
      platform: 'LinkedIn Carousel',
      why: "You've had strong engagement on practical AI content, but haven't covered this topic recently.",
      memory: 'Practical examples drive engagement.',
    },
    {
      id: 2,
      title: 'Behind the scenes: How we create our products',
      platform: 'Instagram Reel',
      why: 'Your audience has responded well to personal and behind-the-scenes content.',
      memory: 'Personal stories are working well.',
    },
    {
      id: 3,
      title: '3 workflow changes that made our team more efficient',
      platform: 'X Post',
      why: 'You often perform best on concise, useful content.',
      memory: 'Short practical advice converts well.',
    },
  ])
  const [calendarPlan, setCalendarPlan] = useState([
    { day: 'Monday', topic: 'AI productivity tips', format: 'Carousel', platform: 'Instagram', status: 'Planned' },
    { day: 'Wednesday', topic: 'Customer story', format: 'Reel', platform: 'LinkedIn', status: 'Draft' },
    { day: 'Friday', topic: 'Behind the scenes', format: 'Post', platform: 'Instagram', status: 'Ready' },
  ])

  const relevantMemories = useMemo(
    () => hindsightService.getRelevantMemories(memoryEntries),
    [memoryEntries],
  )

  useEffect(() => {
    if (memoryEntries.length > 0 && selectedMemory) {
      setSelectedMemory((current) => current ?? memoryEntries[0])
    }
  }, [memoryEntries, selectedMemory])

  const updateMemoryStatus = (status) => {
    setMemoryStatus(status)
    if (status !== 'Using what I’ve learned about your content...') {
      window.setTimeout(() => setMemoryStatus('Using what I’ve learned about your content...'), 1800)
    }
  }

  const buildContentFromInputs = (nextDraft = draft) => {
    const goalTone = {
      Engagement: 'Create a punchy opener and invite the audience to comment or save this post.',
      Followers: 'Lead with a strong point of view and make the value instantly clear.',
      Customers: 'Focus on a practical solution and a direct call to action.',
      Education: 'Explain the concept clearly and give one concrete takeaway.',
    }

    const platformLabel = nextDraft.platform || 'Instagram'
    const typeLabel = nextDraft.type || 'Caption'
    const topicText = nextDraft.topic || 'your topic'

    return {
      platform: platformLabel,
      title: `${platformLabel} ${typeLabel}`,
      hook: `Here is a stronger angle for ${topicText}`,
      caption: `Based on what has worked for you before, I would focus on ${topicText}. Keep the message practical, relatable, and easy to act on. ${goalTone[nextDraft.goal] || goalTone.Engagement}`,
      hashtags: '#AI #ContentStrategy #SmallBusiness #MarketingTips',
      why: 'Your audience responds best to practical, educational ideas that feel immediately useful.',
    }
  }

  const finishOnboarding = () => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(businessProfile))
    } catch {
      // Keep onboarding usable when browser storage is unavailable.
    }
    const profileMemories = [
      {
        id: 'business-profile',
        title: 'Your business',
        detail: `You focus on ${businessProfile.industry.toLowerCase()} and want to ${businessProfile.goal.toLowerCase()}.`,
        basedOn: 'Profile setup',
        confidence: 'High',
        learned: 'Today',
        helps: 'I will tailor content to your goals and industry.',
        evidence: 'Business profile has been stored.',
      },
      {
        id: 'platforms',
        title: 'Your channels',
        detail: `You post primarily on ${businessProfile.platforms.join(', ')}.`,
        basedOn: 'Profile setup',
        confidence: 'High',
        learned: 'Today',
        helps: 'I will prioritize the platforms you use most.',
        evidence: 'Channel preferences are now part of your profile.',
      },
    ]

    setMemoryEntries((current) => profileMemories.reduce((acc, memory) => hindsightService.retainMemory(acc, memory), current))
    setOnboardingVisible(false)
    setSelectedMemory(profileMemories[0])
    updateMemoryStatus('Memory updated ✓')
  }

  const createContentFromDraft = () => {
    const nextContent = buildContentFromInputs(draft)

    setGeneratedContent(nextContent)
    setMemoryEntries((current) =>
      hindsightService.retainMemory(current, {
        id: 'content-performance',
        title: 'What works',
        detail: 'Educational posts outperform broad promotional messaging.',
        basedOn: 'Recent content performance',
        confidence: 'High',
        learned: 'Today',
        helps: 'I will keep recommending useful, educational content.',
        evidence: 'Your audience prefers learning over pure promotion.',
      }),
    )
    updateMemoryStatus('Learning from this...')
  }

  const copyGeneratedContent = async () => {
    const textToCopy = `${generatedContent.hook}\n\n${generatedContent.caption}\n\n${generatedContent.hashtags}`

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        const tempInput = document.createElement('textarea')
        tempInput.value = textToCopy
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
      }
      updateMemoryStatus('Copied to clipboard ✓')
    } catch (error) {
      updateMemoryStatus('Copy failed — try again')
    }
  }

  const regenerateContent = () => {
    setGeneratedContent(buildContentFromInputs({
      ...draft,
      topic: draft.topic || 'your next big idea',
      type: draft.type,
      platform: draft.platform,
      goal: draft.goal,
    }))
    updateMemoryStatus('Learning from this...')
  }

  const saveGeneratedContent = () => {
    const memory = {
      id: 'saved-content',
      title: 'Saved content',
      detail: `You saved a ${generatedContent.platform} ${generatedContent.title.toLowerCase()} focused on ${draft.topic}.`,
      basedOn: 'Your latest saved draft',
      confidence: 'High',
      learned: 'Today',
      helps: 'I will use this direction to suggest similar future content.',
      evidence: 'This draft was saved for future content planning.',
    }

    setMemoryEntries((current) => hindsightService.retainMemory(current, memory))
    setSelectedMemory(memory)
    updateMemoryStatus('Memory updated ✓')
  }

  const handleIdeaCreate = (idea) => {
    const nextDraft = {
      platform: idea.platform.includes('Instagram') ? 'Instagram' : idea.platform.includes('LinkedIn') ? 'LinkedIn' : 'Instagram',
      type: 'Carousel',
      topic: idea.title,
      goal: 'Engagement',
    }

    setDraft(nextDraft)
    setGeneratedContent(buildContentFromInputs(nextDraft))
    setActiveView('home')
    updateMemoryStatus('Using what I’ve learned about your content...')
  }

  const generateIdeas = () => {
    const nextIdeas = [
      {
        id: 1,
        title: '5 practical AI workflows small businesses can automate this week',
        platform: 'LinkedIn Carousel',
        why: 'You have strong engagement on practical AI content, and this topic is still fresh for your audience.',
        memory: 'Educational posts perform well and you have not covered this topic recently.',
      },
      {
        id: 2,
        title: 'Behind the scenes: how we turn ideas into content systems',
        platform: 'Instagram Reel',
        why: 'Your audience responds well to personal and behind-the-scenes content.',
        memory: 'Personal storytelling has been successful.',
      },
      {
        id: 3,
        title: '3 mistakes founders make when choosing marketing tools',
        platform: 'X Post',
        why: 'Practical lessons and clear examples consistently convert well.',
        memory: 'Short educational posts drive the best engagement.',
      },
      {
        id: 4,
        title: 'A simple weekly content plan that saves time',
        platform: 'Instagram Carousel',
        why: 'Your audience likes helpful systems and actionable advice.',
        memory: 'Content that reduces effort performs strongly.',
      },
    ]

    setIdeas(nextIdeas)
    setActiveView('ideas')
    updateMemoryStatus('Using what I’ve learned about your content...')
  }

  const generateWeek = () => {
    setCalendarPlan([
      { day: 'Monday', topic: 'AI productivity tips', format: 'Carousel', platform: 'Instagram', status: 'Planned' },
      { day: 'Wednesday', topic: 'Customer story', format: 'Reel', platform: 'LinkedIn', status: 'Draft' },
      { day: 'Friday', topic: 'Behind the scenes', format: 'Post', platform: 'Instagram', status: 'Ready' },
    ])
    setActiveView('calendar')
    updateMemoryStatus('Using what I’ve learned about your content...')
  }

  const handlePromptSubmit = (event) => {
    event.preventDefault()
    if (!chatInput.trim()) return

    const normalizedInput = chatInput.toLowerCase()
    const relevant = hindsightService.recallMemory(memoryEntries, 'content') ?? memoryEntries[0]

    const inferredGoal = normalizedInput.includes('linkedin') ? 'LinkedIn' : normalizedInput.includes('instagram') ? 'Instagram' : 'LinkedIn'
    const finalHook = normalizedInput.includes('what should i post')
      ? 'Based on what has worked for you before, this is the best angle'
      : normalizedInput.includes('why did my last post')
        ? 'Your last content performed well because it was practical and useful'
        : 'Here is the best angle for this week'

    const finalCaption = normalizedInput.includes('what should i post')
      ? `Based on ${relevant?.detail?.toLowerCase() || 'your audience insights'}, I would focus on practical educational content this week. Share a simple lesson, a real example, and one action your audience can try today.`
      : normalizedInput.includes('why did my last post')
        ? `It worked because your audience responds best to practical examples, and your recent content has established a clear pattern: useful, educational posts outperform broad promotion.`
        : `I looked at what has worked for you before and kept this message aligned with your strongest content pattern: practical, helpful, and easy to act on.`

    setGeneratedContent({
      platform: inferredGoal,
      title: `${inferredGoal} Post`,
      hook: finalHook,
      caption: finalCaption,
      hashtags: '#AI #Productivity #SmallBusiness #ContentStrategy',
      why: relevant ? `This recommendation is grounded in your memory: ${relevant.detail}` : 'This recommendation is based on your recent content patterns.',
    })
    setActiveView('home')
    updateMemoryStatus('Using what I’ve learned about your content...')
  }

  const renderHome = () => (
    <div className="page-block">
      <div className="topbar-info">
        <span className="memory-pill">🧠 ChronicleAI memory</span>
        <span className="status-copy">{memoryStatus}</span>
      </div>

      <div className="home-hero-grid">
        <header className="page-header home-hero-copy">
          <div>
            <p className="eyebrow">Your autonomous head of content</p>
            <h1>Your brand finally <span>remembers</span> everything.</h1>
            <p className="subheading">ChronicleAI is your strategy agent with long-term memory. It recalls every post, every metric, and every editorial note—then helps you create content that sounds like you.</p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => setActiveView('results')}>Run the memory showdown <span aria-hidden="true">→</span></button>
              <button type="button" className="hero-secondary" onClick={() => setActiveView('create')}>Open Agent Studio</button>
            </div>
            <div className="hero-signals">
              <span>{memoryEntries.length} memories indexed</span>
              <span>Voice fidelity learning</span>
              <span>{relevantMemories.length} active insights</span>
            </div>
          </div>
          <div className="memory-visual" aria-label="Recent brand memory insights">
            <article className="visual-note visual-note-top">
              <small>EPISODIC MEMORY</small>
              <strong>{memoryEntries[0]?.title ?? 'Your audience'}</strong>
              <span>{memoryEntries[0]?.detail ?? 'Practical content resonates.'}</span>
            </article>
            <div className="visual-orb">AI</div>
            <article className="visual-note visual-note-right">
              <small>VOICE RULE</small>
              <strong>Keep it conversational</strong>
              <span>Applied to every draft</span>
            </article>
            <article className="visual-note visual-note-bottom">
              <small>REFLECTIVE INSIGHT</small>
              <strong>{memoryEntries[1]?.title ?? 'Content pattern'}</strong>
              <span>{memoryEntries[1]?.detail ?? 'Learning from your content history.'}</span>
            </article>
          </div>
        </header>
      </div>

      <form className="ask-box" onSubmit={handlePromptSubmit}>
        <input
          type="text"
          value={chatInput}
          onChange={(event) => setChatInput(event.target.value)}
          placeholder="Ask ChronicleAI anything..."
          aria-label="Ask ChronicleAI anything"
        />
      </form>

      <div className="prompt-suggestions">
        <button type="button" onClick={() => setChatInput('What should I post this week?')}>What should I post this week?</button>
        <button type="button" onClick={() => setChatInput('Give me Instagram ideas.')}>Give me Instagram ideas.</button>
        <button type="button" onClick={() => setChatInput('Create a LinkedIn post.')}>Create a LinkedIn post.</button>
        <button type="button" onClick={() => setChatInput('Why did my last post perform well?')}>Why did my last post perform well?</button>
      </div>

      <div className="action-grid">
        <button type="button" className="action-card primary" onClick={() => setActiveView('create')}>
          <span className="card-icon">✨</span>
          <strong>Create Content</strong>
          <small>Turn your idea into a ready-to-post caption, reel or article.</small>
        </button>
        <button type="button" className="action-card" onClick={generateIdeas}>
          <span className="card-icon">💡</span>
          <strong>Get Ideas</strong>
          <small>Discover what you should post next based on what has worked before.</small>
        </button>
        <button type="button" className="action-card" onClick={() => setActiveView('results')}>
          <span className="card-icon">📊</span>
          <strong>See Results</strong>
          <small>Understand what your audience responds to.</small>
        </button>
      </div>

      <div className="content-card">
        <div className="card-heading-row">
          <span>{generatedContent.title}</span>
          <span className="platform-badge">{generatedContent.platform}</span>
        </div>

        <h3>{generatedContent.hook}</h3>

        <p className="caption-body">{generatedContent.caption}</p>

        <div className="hashtags">{generatedContent.hashtags}</div>

        <div className="card-actions">
          <button type="button" className="ghost-button" onClick={copyGeneratedContent}>Copy</button>
          <button type="button" className="ghost-button" onClick={() => setActiveView('create')}>Edit</button>
          <button type="button" className="ghost-button" onClick={regenerateContent}>Regenerate</button>
          <button type="button" className="primary-button" onClick={saveGeneratedContent}>Save</button>
        </div>

        <div className="memory-copy">
          <strong>🧠 Why ChronicleAI suggested this</strong>
          <p>{generatedContent.why}</p>
        </div>
      </div>
    </div>
  )

  const renderCreate = () => (
    <div className="page-block narrow-block">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Create</p>
          <h1>Create something great ✨</h1>
        </div>
      </header>

      <div className="form-card">
        <label>
          <span>Platform</span>
          <select value={draft.platform} onChange={(event) => setDraft({ ...draft, platform: event.target.value })}>
            {['Instagram', 'LinkedIn', 'Facebook', 'X', 'Blog'].map((platform) => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </label>

        <label>
          <span>What do you want to create?</span>
          <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>
            {['Caption', 'Post', 'Reel idea', 'Carousel', 'Blog', 'Video script'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Topic</span>
          <input
            type="text"
            value={draft.topic}
            onChange={(event) => setDraft({ ...draft, topic: event.target.value })}
            placeholder="Type your topic..."
          />
        </label>

        <label>
          <span>Goal</span>
          <select value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })}>
            {['Engagement', 'Followers', 'Customers', 'Education'].map((goal) => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </label>

        <button type="button" className="primary-button full-width" onClick={createContentFromDraft}>
          Create with ChronicleAI
        </button>
      </div>
    </div>
  )

  const renderIdeas = () => (
    <div className="page-block">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Ideas</p>
          <h1>What should I post next?</h1>
          <p className="subheading">ChronicleAI looks at what you've posted, what worked, and what your audience likes.</p>
        </div>
      </header>

      <div className="idea-list">
        {ideas.map((idea, index) => (
          <article key={idea.id} className="idea-card">
            <div className="idea-header">
              <span className="idea-number">{String(index + 1).padStart(2, '0')}</span>
              <h3>{idea.title}</h3>
            </div>
            <div className="idea-meta">
              <span>{idea.platform}</span>
            </div>
            <p className="idea-why-label">Why this idea?</p>
            <p>{idea.why}</p>
            <div className="mini-memory">{idea.memory}</div>
            <button type="button" className="primary-button" onClick={() => handleIdeaCreate(idea)}>Create this →</button>
          </article>
        ))}
      </div>
    </div>
  )

  const renderCalendar = () => (
    <div className="page-block">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Calendar</p>
          <h1>Your Content Plan</h1>
        </div>
      </header>

      <div className="calendar-grid">
        {calendarPlan.map((item) => (
          <article key={item.day} className="calendar-card">
            <div className="calendar-day">{item.day}</div>
            <h3>{item.topic}</h3>
            <div className="meta-list">
              <span>Platform: {item.platform}</span>
              <span>Format: {item.format}</span>
              <span>Status: {item.status}</span>
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="primary-button" onClick={generateWeek}>Generate my week</button>
    </div>
  )

  const renderResults = () => (
    <div className="page-block">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Results</p>
          <h1>How is your content doing?</h1>
        </div>
      </header>

      <div className="results-grid">
        <div className="result-panel highlight">
          <h3>⭐ What’s working</h3>
          <p>Educational content is performing well.</p>
        </div>
        <div className="result-panel">
          <h3>📈 Your best post</h3>
          <p>“5 AI workflows that save businesses hours”</p>
        </div>
        <div className="result-panel">
          <h3>👥 Your audience likes</h3>
          <p>Short practical tips.</p>
        </div>
        <div className="result-panel">
          <h3>💡 Try next</h3>
          <p>Experiment with more carousel posts.</p>
        </div>
      </div>
    </div>
  )

  const renderMemory = () => (
    <div className="page-block">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Memory</p>
          <h1>🧠 What I Remember</h1>
          <p className="subheading">ChronicleAI remembers what works for you.</p>
        </div>
      </header>

      <div className="memory-grid">
        <div className="memory-list">
          {memoryEntries.map((memory) => (
            <button
              key={memory.id}
              type="button"
              className={`memory-item ${selectedMemory?.id === memory.id ? 'selected' : ''}`}
              onClick={() => setSelectedMemory(memory)}
            >
              <strong>{memory.title}</strong>
              <span>{memory.detail}</span>
            </button>
          ))}
        </div>

        <div className="memory-detail">
          <h3>What I learned</h3>
          <p>{selectedMemory?.detail}</p>
          <div className="detail-row">
            <span>Based on</span>
            <strong>{selectedMemory?.basedOn}</strong>
          </div>
          <div className="detail-row">
            <span>Confidence</span>
            <strong>{selectedMemory?.confidence}</strong>
          </div>
          <div className="detail-row">
            <span>Learned</span>
            <strong>{selectedMemory?.learned}</strong>
          </div>
          <div className="detail-row">
            <span>How this helps</span>
            <strong>{selectedMemory?.helps}</strong>
          </div>
        </div>
      </div>

      <div className="hindsight-note">Memory powered by Hindsight</div>
    </div>
  )

  const renderSettings = () => (
    <div className="page-block narrow-block">
      <header className="page-header compact-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Preferences</h1>
        </div>
      </header>

      <div className="settings-card">
        <div className="profile-summary">
          <span>Business</span>
          <strong>{businessProfile.industry}</strong>
        </div>
        <div className="profile-summary">
          <span>Audience</span>
          <strong>{businessProfile.audience}</strong>
        </div>
        <div className="profile-summary">
          <span>Platforms</span>
          <strong>{businessProfile.platforms.join(', ')}</strong>
        </div>

        <button type="button" className="primary-button full-width" onClick={() => setDemoOpen(true)}>
          See how memory works
        </button>
      </div>
    </div>
  )

  const renderDemoModal = () => (
    <div className="modal-backdrop" onClick={() => setDemoOpen(false)} role="presentation">
      <div className="demo-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={() => setDemoOpen(false)}>×</button>
        <h2>See how memory works</h2>

        <div className="demo-section">
          <h3>WITHOUT MEMORY</h3>
          <p><strong>User:</strong> “What should I post next week?”</p>
          <p><strong>AI:</strong> “Here are some general content ideas...”</p>
        </div>

        <div className="demo-section">
          <h3>WITH CONTENTMIND MEMORY</h3>
          <p><strong>User:</strong> “What should I post next week?”</p>
          <p><strong>ChronicleAI:</strong> “Based on your previous content, I recommend...”</p>
          <ul>
            <li>🧠 Your audience likes practical tips</li>
            <li>🧠 Educational posts performed well</li>
            <li>🧠 You haven’t covered this topic recently</li>
            <li>🧠 Your preferred style is conversational</li>
          </ul>
        </div>

        <div className="recommended-post">
          <strong>Recommended post</strong>
          <p>“5 practical AI workflows small businesses can automate this week.”</p>
        </div>
      </div>
    </div>
  )

  const viewMap = {
    home: renderHome(),
    create: renderCreate(),
    ideas: renderIdeas(),
    calendar: renderCalendar(),
    results: renderResults(),
    memory: renderMemory(),
    settings: renderSettings(),
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
        <div className="logo-mark">C</div>
          <div>
            <strong>ChronicleAI</strong>
            <small>THE CONTENT STRATEGY AGENT</small>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={activeView === item.key ? 'nav-item active' : 'nav-item'}
              aria-current={activeView === item.key ? 'page' : undefined}
              onClick={() => setActiveView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="content-panel">{viewMap[activeView]}</main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={activeView === item.key ? 'mobile-item active' : 'mobile-item'}
            aria-label={item.label.replace(/^\S+\s*/, '')}
            aria-current={activeView === item.key ? 'page' : undefined}
            onClick={() => setActiveView(item.key)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {onboardingVisible && (
        <div className="onboarding-overlay">
          <div className="onboarding-card">
            <h2>Let’s get to know your business.</h2>

            <div className="onboarding-step">
              <label>
                <span>What do you do?</span>
                <div className="choice-grid">
                  {businessTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={businessProfile.industry === type ? 'choice selected' : 'choice'}
                      onClick={() => setBusinessProfile({ ...businessProfile, industry: type })}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="onboarding-step">
              <label>
                <span>Who are your customers?</span>
                <input
                  type="text"
                  value={businessProfile.audience}
                  onChange={(event) => setBusinessProfile({ ...businessProfile, audience: event.target.value })}
                  placeholder="Describe your ideal audience"
                />
              </label>
            </div>

            <div className="onboarding-step">
              <label>
                <span>Where do you post?</span>
                <div className="tag-group">
                  {['Instagram', 'LinkedIn', 'Facebook', 'YouTube', 'X'].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      className={businessProfile.platforms.includes(platform) ? 'tag active' : 'tag'}
                      onClick={() => {
                        const next = businessProfile.platforms.includes(platform)
                          ? businessProfile.platforms.filter((item) => item !== platform)
                          : [...businessProfile.platforms, platform]

                        setBusinessProfile({ ...businessProfile, platforms: next })
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="onboarding-step">
              <label>
                <span>What do you want to achieve?</span>
                <div className="tag-group">
                  {['Get followers', 'Get customers', 'Build awareness', 'Increase engagement', 'Educate audience'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      className={businessProfile.goal === goal ? 'tag active' : 'tag'}
                      onClick={() => setBusinessProfile({ ...businessProfile, goal })}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <button type="button" className="primary-button full-width" onClick={finishOnboarding}>
              Start Creating →
            </button>
          </div>
        </div>
      )}

      {demoOpen && renderDemoModal()}
    </div>
  )
}

export default App
