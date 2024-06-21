interface BoxProps{
    message: string
}

export function Box({message}: BoxProps){
    return <div className="box center">{message}</div>;
}