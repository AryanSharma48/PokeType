import Header from "./components/header"
import Main from "./components/main"
import AudioToggle from "./components/AudioToggle"
import PikachuGreeting from "./components/PikachuGreeting"

export default function App(){
    return(
        <>
            <AudioToggle />
            <Header />
            <Main />
            <PikachuGreeting />
        </>
    )
}