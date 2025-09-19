import SubNav from "../components/SubNav";

export default function AboutMe() {
  return (
    <div className="article-page">
      <article className="article">
        <h1>About me</h1>
        <SubNav current="about-me" />
        <p>
          I’m Luci, a developer who loves collaborating with people, exploring different aspects of projects, and continuously learning along the way. Based in San Francisco for nearly a decade but originally from Brazil, I have a background in linguistics, languages, and literature, which sparked my fascination with how systems work—whether it’s grammar or algorithms—and led me to explore the logic of code, natural language processing, and machine learning. I approach problems with curiosity and creative thinking, breaking them into manageable pieces and focusing on building tools that are functional and engaging for the people who use them. My empathy shows in how I work with others: I communicate clearly, adapt easily to new challenges, and enjoy collaborating across cultures and disciplines. Outside of coding I nurture my love of storytelling through photography and writing—pursuits that keep me curious and give me a broader perspective to draw on in my technical work. I’m fluent in Portuguese and English and thrive in diverse, collaborative environments.
        </p>
      </article>
    </div>
  );
}
