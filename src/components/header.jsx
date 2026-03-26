import "../styles/Header.css"
import pokeballImg from "../images/pokeball.png"

export default function Header(){
    return(
        <header>
            <div className="logo">
                <img src={pokeballImg} alt="logo" />
                <span><span className="poke-red">Poké</span>Type</span>
            </div>
        </header>
    )
}