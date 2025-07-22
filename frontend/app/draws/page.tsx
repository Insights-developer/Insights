import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

export default function DrawsPage() {
  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', padding: 20 }}>
      <Card title="Draws" icon={<Icon name="shuffle" animate />}>
        <p>View and upload draw results or analyze recent draws.</p>
      </Card>
    </main>
  );
}
