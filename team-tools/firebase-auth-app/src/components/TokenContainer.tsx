interface TokenContainerProps {
  token: string;
}

export const TokenContainer = ({ token }: TokenContainerProps) => (
  <div className="token-container">
    <span>{token}</span>
    <div>
      <button onClick={() => navigator.clipboard.writeText(token)}>Copy</button>
      <button onClick={() => window.open(`https://jwt.io/#token=${token}`)}>
        View on JWT.io
      </button>
    </div>
  </div>
);
