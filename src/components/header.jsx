import "../styles/header.css"

export default function Header(){
    return(
        <header>
            <div className="logo">
                <img src="/src/images/logo.png" alt="logo" />
                <span>TheTypist</span>
            </div>
            <div className="nav">
                <span>Settings</span>
                <span className="profile">Profile</span>
            </div>
        </header>
    )
}