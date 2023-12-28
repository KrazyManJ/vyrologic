import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface MathProps {
    children: string | number
    inline?: boolean
}

const Math = (props: MathProps) => {
    const symbol = props.inline ?? false ? "$" : "$$";
    return <Latex>{symbol+props.children+symbol}</Latex>;
}

export default Math;