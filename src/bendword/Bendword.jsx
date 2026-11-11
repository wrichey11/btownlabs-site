import Game from './game/Game';
import './bendword.css';

const appStore = 'https://apps.apple.com/app/bendword/id6827767246';
const media = '/images/bendword/';

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
            <a className="bw-nav-link" href="#gameplay">How it works</a>
            <a className="bw-button bw-nav-store" href={appStore}>App Store <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>

      <main id="bw-main">
        <section className="bw-wrap bw-play" aria-label="Today's puzzle">
          <p className="bw-label bw-play-label"><span className="bw-dot" /> THE DAILY WORD PUZZLE</p>
          <Game />
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
          <div><h2>A new bend every day.</h2><p>Keep your streak going with the archive, reminders, and stats in the app.</p></div>
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
