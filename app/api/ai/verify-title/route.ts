import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, activityType, description } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Titlul este obligatoriu' }, { status: 400 });
    }

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `Ești un expert în verificarea conformității titlurilor de activități pentru proiecte cu finanțare europeană (PEO).
Verifică dacă titlul activității este:
1. Relevant pentru tipul de activitate specificat
2. Suficient de descriptiv și clar
3. Formulat profesional
4. Conform cu standardele de raportare PEO

Răspunde scurt și concis în limba română.`,
      prompt: `Verifică titlul activității:

Titlu: "${title}"
Tip activitate: ${activityType}
Descriere: ${description || 'Fără descriere'}

Oferă o evaluare scurtă (2-3 propoziții) și sugestii de îmbunătățire dacă este cazul.`,
    });

    return NextResponse.json({ result: result.text });
  } catch (error) {
    console.error('Error verifying title:', error);
    return NextResponse.json(
      { error: 'Eroare la verificarea titlului' },
      { status: 500 }
    );
  }
}
