import { useEffect, useState } from 'preact/hooks';
import { getFirestoreDb } from '../lib/firebase';
import { collection, query, where, getDocs, runTransaction, addDoc, doc, serverTimestamp } from 'firebase/firestore';
import { t, getLocale } from '../lib/i18n';

interface QuestionItem {
  id: string;
  text: string;
  isActive: boolean;
}

export default function FeedbackForm() {
  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [lastSubmit, setLastSubmit] = useState(0);
  const [questionError, setQuestionError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [, setLocale] = useState(getLocale());

  const cooldownMs = 30000;
  const canSubmit = Date.now() - lastSubmit >= cooldownMs;

  useEffect(() => {
    function onLangChange() { setLocale(getLocale()); }
    window.addEventListener('langchange', onLangChange);
    return () => window.removeEventListener('langchange', onLangChange);
  }, []);

  useEffect(() => { loadQuestion(); }, []);

  async function loadQuestion() {
    try {
      const db = getFirestoreDb();
      const q = query(collection(db, 'preguntas'), where('isActive', '==', true));
      const snap = await getDocs(q);
      const active: QuestionItem[] = [];
      snap.forEach((doc) => {
        active.push({ id: doc.id, text: doc.data().text || '', isActive: true });
      });
      if (active.length > 0) {
        setQuestion(active[Math.floor(Math.random() * active.length)]);
      } else {
        setQuestion({ id: 'fallback', text: '¿Cómo calificarías el servicio turístico?', isActive: true });
      }
    } catch (e: any) {
      console.error('Failed to load question:', e);
      setQuestionError('No se pudo cargar la pregunta');
      setQuestion({ id: 'fallback', text: '¿Cómo calificarías el servicio turístico?', isActive: true });
    }
  }

  async function submitRating() {
    if (!question || rating === 0) return;
    setIsSubmittingRating(true);
    try {
      const db = getFirestoreDb();
      const docRef = doc(db, 'preguntas', question.id);
      if (question.id === 'fallback') { setRatingSubmitted(true); setRating(0); return; }
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const dist = [...(data.starDistribution || [0, 0, 0, 0, 0])];
        const total = (data.totalResponses || 0) + 1;
        const idx = rating - 1;
        if (idx >= 0 && idx < 5) dist[idx] = (dist[idx] || 0) + 1;
        transaction.update(docRef, { starDistribution: dist, totalResponses: total });
      });
      setRatingSubmitted(true);
      setRating(0);
    } catch (e) {
      console.error('Failed to submit rating:', e);
    } finally {
      setIsSubmittingRating(false);
    }
  }

  async function submitComment() {
    if (!comment.trim()) return;
    setIsSubmittingComment(true);
    setCommentError('');
    try {
      const db = getFirestoreDb();
      await addDoc(collection(db, 'feedback'), {
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        isRead: false,
      });
      setComment('');
      setCommentSubmitted(true);
      setLastSubmit(Date.now());
    } catch (e) {
      console.error('Failed to submit comment:', e);
      setCommentError('Error al enviar. Intenta de nuevo.');
    } finally {
      setIsSubmittingComment(false);
    }
  }

  return (
    <section id="contacto" class="bg-footer-dark px-md py-2xl">
      {question && (
        <div class="mb-2xl">
          <h3 class="text-white text-lg font-bold text-center mb-sm" data-i18n="pregunta_rapida">{t('pregunta_rapida')}</h3>
          {ratingSubmitted ? (
            <div class="flex items-center justify-center gap-sm bg-green-dark/30 rounded-md p-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span class="text-green-dark text-[15px] font-semibold" data-i18n="gracias_calificacion">{t('gracias_calificacion')}</span>
            </div>
          ) : (
            <>
              {questionError && <p class="text-red-400 text-xs text-center mb-sm">{questionError}</p>}
              <p class="text-white/70 text-sm text-center mb-lg">{question.text}</p>
              <div class="flex justify-center gap-sm mb-md">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} class="flex flex-col items-center bg-transparent border-none cursor-pointer px-1">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill={star <= rating ? '#FFC107' : 'none'} stroke={star <= rating ? '#FFC107' : '#D0D0D0'} stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span class={`text-xs mt-1 ${star <= rating ? 'text-star-filled' : 'text-text-light'}`}>{star}</span>
                  </button>
                ))}
              </div>
              <button onClick={submitRating} disabled={isSubmittingRating || rating === 0} class="w-full flex items-center justify-center gap-sm py-md bg-cta-orange text-white font-semibold text-sm rounded-md border-none cursor-pointer disabled:opacity-40 hover:bg-cta-orange-dark transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span data-i18n="enviar_calificacion">{t('enviar_calificacion')}</span>
              </button>
            </>
          )}
        </div>
      )}

      <h3 class="text-white text-lg font-bold text-center mb-sm" data-i18n="quejas_sugerencias">{t('quejas_sugerencias')}</h3>
      <p class="text-white/70 text-[13px] text-center mb-md" data-i18n="opinion_ayuda">{t('opinion_ayuda')}</p>

      <textarea
        value={comment}
        onInput={(e: any) => setComment(e.target.value)}
        rows={4}
        data-i18n-ph="hint_queja"
        placeholder={t('hint_queja')}
        class="w-full bg-white/10 text-white text-sm p-md rounded-md border-none resize-none placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-header-blue/50 mb-md"
      />

      <button onClick={submitComment} disabled={isSubmittingComment || !comment.trim() || !canSubmit} class="w-full flex items-center justify-center gap-sm py-md bg-cta-orange text-white font-semibold text-sm rounded-md border-none cursor-pointer disabled:opacity-40 hover:bg-cta-orange-dark transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        <span data-i18n="enviar_comentario">{t('enviar_comentario')}</span>
      </button>

      {commentError && (
        <p class="text-red-400 text-xs text-center mt-sm">{commentError}</p>
      )}

      {commentSubmitted && (
        <div class="flex items-center justify-center gap-xs mt-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span class="text-green-dark text-[13px]" data-i18n="comentario_enviado">{t('comentario_enviado')}</span>
        </div>
      )}
    </section>
  );
}
