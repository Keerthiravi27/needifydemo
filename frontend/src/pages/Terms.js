import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/signup">
          <Button variant="ghost" data-testid="terms-back-btn" className="mb-6 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Signup
          </Button>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-8 md:p-12">
          <h1 className="text-4xl font-bold font-outfit text-primary-foreground mb-6">
            Terms & Conditions
          </h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

          <div className="space-y-6 text-foreground leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">1. Acceptance of Terms</h2>
              <p>
                By creating an account on Needify, you agree to these Terms & Conditions. If you do not
                agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">2. Eligibility</h2>
              <p>
                Needify is intended for college students. You must be at least 18 years old or have
                parental consent to use this platform. By signing up, you confirm that you are a student
                or affiliated with an educational institution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">3. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for maintaining the confidentiality of your account.</li>
                <li>You agree to provide accurate and truthful information.</li>
                <li>You will not engage in fraudulent activities or misrepresent services/gigs.</li>
                <li>You will treat other users with respect and professionalism.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">4. Gigs & Services</h2>
              <p>
                Gigs and services posted on Needify are agreements between individual users. Needify acts
                as a platform facilitator and is not responsible for the quality or completion of any gig
                or service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">5. Commission & Payments</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Needify charges a 15% commission on all transactions.</li>
                <li>Cancellations made after 2 minutes incur a 50% cancellation fee.</li>
                <li>Payment disputes should be resolved between users; Needify may mediate if necessary.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">6. Ratings & Reviews</h2>
              <p>
                Users can rate and review each other after completing a transaction. Reviews must be
                honest, respectful, and based on actual experiences. False or defamatory reviews may result
                in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">7. Privacy</h2>
              <p>
                We respect your privacy. Your personal information will not be shared with third parties
                without your consent, except as required by law. Please see our Privacy Policy for more
                details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">8. Termination</h2>
              <p>
                Needify reserves the right to suspend or terminate accounts that violate these terms or
                engage in inappropriate behavior.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">9. Limitation of Liability</h2>
              <p>
                Needify is not liable for any damages arising from the use of the platform, including but
                not limited to financial loss, disputes between users, or service quality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold font-outfit mb-3">10. Changes to Terms</h2>
              <p>
                Needify may update these terms at any time. Continued use of the platform constitutes
                acceptance of updated terms.
              </p>
            </section>

            <section className="mt-8 pt-8 border-t border-green-100">
              <p className="text-muted-foreground">
                If you have any questions about these Terms & Conditions, please contact us at{' '}
                <a href="mailto:support@needify.com" className="text-primary font-semibold hover:underline">
                  support@needify.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
