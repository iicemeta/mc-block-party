import { Button } from "minecraft-react-ui";

export default function HeroCta() {
  return (
    <div className="HeroCta">
      <a href="/me">
        <Button variant="primary">登录并报名</Button>
      </a>
      <a href="/lottery">
        <Button variant="secondary">查看随机组队</Button>
      </a>
    </div>
  );
}
