import Card from '../components/ui/Cards';
import Button from '../components/ui/Buttons';

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card>
        <div style={{ padding: 30, textAlign: 'center' }}>
          <Button variant="primary">HELLO BUTTON</Button>
        </div>
      </Card>
    </main>
  );
}
