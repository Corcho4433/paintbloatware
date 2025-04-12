import React from "react"

export const Button: React.FC<{ count: number, handleClick: () => void }> = ({ count, handleClick }) => {

    return (
        <button onClick={handleClick}>
        {count}
        </button>
    )
}