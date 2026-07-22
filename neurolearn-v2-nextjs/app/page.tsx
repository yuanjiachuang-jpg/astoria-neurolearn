import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TopicStory from "@/components/TopicStory";
import PromptLab from "@/components/PromptLab";
import ModelCompare from "@/components/ModelCompare";
import Method from "@/components/Method";
import Footer from "@/components/Footer";
import { topics } from "@/data/content";

export default function Home(){return <main><Navbar/><Hero/><section id="learn">{topics.map((topic,index)=><TopicStory key={topic.id} topic={topic} index={index}/>)}</section><PromptLab/><ModelCompare/><Method/><Footer/></main>}
