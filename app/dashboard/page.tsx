import { redirect } from 'next/navigation';
import { getStaffAccess } from '@/lib/auth';
import { signOut } from '@/app/auth/actions';

function SignOutButton() {
  return <form action={signOut}><button className="btn button" type="submit">Sign Out</button></form>;
}

export default async function Dashboard() {
  const access = await getStaffAccess();
  if (access.status === 'unauthenticated') redirect('/login');

  if (access.status === 'unavailable') {
    return <section className="section wrap"><h1>Workspace unavailable</h1><p>We could not verify staff access. Please try again shortly.</p><SignOutButton /></section>;
  }

  if (access.status === 'pending') {
    return <section className="section wrap"><h1>Access pending</h1><p>Your account is signed in but has not been approved for the private CRM.</p><SignOutButton /></section>;
  }

  return (
    <section className="section wrap">
      <p className="eyebrow">Private Workspace</p>
      <h1>Hartung Xoatings CRM</h1>
      <p className="muted">Signed in as {access.user.email} ({access.role})</p>
      <SignOutButton />
      <div className="cards">
        {['Municipalities & Utilities', 'Contacts', 'Water Towers', 'Opportunities', 'Activity Log', 'Quote Requests'].map(title => (
          <div className="card" key={title}><h3>{title}</h3><p className="muted">Management interface is the next milestone.</p></div>
        ))}
      </div>
    </section>
  );
}
