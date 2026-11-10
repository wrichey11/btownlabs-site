import { useState } from 'react';
import './bendword.css';

const appStore = 'https://apps.apple.com/app/bendword/id6827767246';
const media = '/images/bendword/';

function SampleBend() {
  const [guess, setGuess] = useState('');
  const [state, setState] = useState('ready');
  const [hint, setHint] = useState(false);

  function check(event) {
    event.preventDefault();
    if (!guess.trim()) return;
    setState(guess.trim().toUpperCase() === 'POWER' ? 'solved' : 'retry');
  }

  return (
    <section className="bw-sample" id="try" aria-labelledby="bw-sample-title">
      <header className="bw-sample-head">
        <div>
          <p className="bw-label">ARCHIVE PUZZLE 255</p>
          <h2 id="bw-sample-title">Try a bend</h2>
        </div>
        <span className="bw-sample-tag">1 of 5</span>
      </header>
      <div className="bw-wordpath" aria-label="Start: TOWER. Goal: END.">
        <div><span>START</span><strong>TOWER</strong></div>
        <span className="bw-arrow" aria-hidden="true">→</span>
        <div><span>GOAL</span><strong>END</strong></div>
      </div>
      <div className="bw-clue">
        <p className="bw-label">FIRST BEND · CHANGE ONE LETTER</p>
        <p id="bw-clue-text">Energy</p>
      </div>
      {state === 'solved' ? (
        <div className="bw-solved" role="status">
          <strong>✓ TOWER → POWER</strong>
          <span>Swap T for P. One bend down!</span>
        </div>
      ) : (
        <form className="bw-form" onSubmit={check}>
          <label htmlFor="bw-guess">What word comes next?</label>
          <div className="bw-inputrow">
            <input id="bw-guess" value={guess} onChange={(event) => {
              setGuess(event.target.value);
              setState('ready');
            }} placeholder="Type a word" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={24} aria-describedby="bw-clue-text bw-feedback" />
            <button className="bw-button bw-check" type="submit">Check <span aria-hidden="true">↵</span></button>
          </div>
          <div className="bw-feedback">
            <p id="bw-feedback" role="status">{state === 'retry' ? 'Try a word that means energy.' : hint ? 'Hint: it starts with P.' : 'Keep the other four letters in place.'}</p>
            <button type="button" onClick={() => { setHint(!hint); setState('ready'); }} aria-pressed={hint}>
              {hint ? 'Hide hint' : 'Get a hint'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function Bendword() {
  return (
    <div className="bw">
      <a className="bw-skip" href="#bw-main">Skip to content</a>
      <header className="bw-header">
        <div className="bw-wrap bw-nav">
          <a href="/bendword" className="bw-brand">
            <img src={media + 'icon.png'} alt="" width="42" height="42" /> Bendword
          </a>
          <nav aria-label="Bendword">
            <a className="bw-nav-link" href="#gameplay">Gameplay</a>
            <a className="bw-button bw-nav-store" href={appStore}>App Store <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>

      <main id="bw-main">
        <section className="bw-wrap bw-hero">
          <div className="bw-intro">
            <p className="bw-label"><span className="bw-dot" /> THE DAILY WORD PUZZLE</p>
            <h1>One word leads to another</h1>
            <p className="bw-lede">Bend one word into another. Follow clues, swap letters, and spot surprising connections along the way.</p>
            <div className="bw-actions">
              <a className="bw-button" href={appStore}>Get Bendword free <span aria-hidden="true">↗</span></a>
              <a className="bw-textlink" href="#gameplay">Watch a solve <span aria-hidden="true">↓</span></a>
            </div>
            <p className="bw-availability">For iPhone and iPad · No account needed</p>
          </div>
          <SampleBend />
        </section>

        <section id="gameplay" className="bw-gameplay" aria-labelledby="bw-gameplay-title">
          <div className="bw-wrap bw-gameplay-grid">
            <div>
              <p className="bw-label">A SOLVE IN 30 SECONDS</p>
              <h2 id="bw-gameplay-title">Every word is a stepping stone.</h2>
              <p className="bw-demo-text">How do you get from <strong>TOWER</strong> to <strong>END</strong>? Watch a past puzzle come together, one bend at a time.</p>
              <ol className="bw-steps">
                <li><span>01</span><div><strong>Start with the clue</strong><p>Each bend gives you a rule, a clue, or both.</p></div></li>
                <li><span>02</span><div><strong>Connect the words</strong><p>Change a letter, finish a phrase, or find a word hiding inside another.</p></div></li>
                <li><span>03</span><div><strong>Reach the target</strong><p>Every answer becomes the starting point for the next bend.</p></div></li>
              </ol>
            </div>
            <figure className="bw-film">
              <video controls playsInline preload="none" poster={media + 'poster.jpg'} width="1080" height="1920" aria-label="Bendword gameplay: TOWER to END" aria-describedby="bw-film-caption">
                <source src={media + 'gameplay.mp4'} type="video/mp4" />
                <a href={media + 'gameplay.mp4'}>Watch the gameplay video</a>
              </video>
              <figcaption id="bw-film-caption">Past puzzle walkthrough · Includes the solution</figcaption>
            </figure>
          </div>
        </section>

        <section className="bw-wrap bw-last">
          <img src={media + 'icon.png'} alt="" width="68" height="68" loading="lazy" />
          <div><h2>A new bend every day.</h2><p>Play today’s puzzle or explore the archive.</p></div>
          <a className="bw-button" href={appStore}>Get it on the App Store <span aria-hidden="true">↗</span></a>
        </section>
      </main>

      <footer className="bw-footer">
        <div className="bw-wrap">
          <a href="/">Made by Btown Labs</a>
          <div><a href="/privacy/bendword">Privacy</a><a href="mailto:hello@btownlabs.com">Contact</a></div>
        </div>
      </footer>
    </div>
  );
}
