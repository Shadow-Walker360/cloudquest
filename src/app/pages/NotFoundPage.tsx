import { ButtonLink } from '../../components/ButtonLink.tsx'
import { Main } from '../Main.tsx'
import { hrefFor } from '../routes.ts'

export function NotFoundPage() {
  return (
    <Main className="fatal">
      <h1>Page not found</h1>
      <p>That page does not exist. It may have moved, or the link may be mistyped.</p>
      <ButtonLink href={hrefFor({ name: 'landing' })}>Go to the CloudQuest home page</ButtonLink>
    </Main>
  )
}
