import { ContactInfo } from "@/data/teamData";
import { Mail, Phone, MapPin, Facebook, Github, ExternalLink } from "lucide-react";

interface ContactSectionProps {
  contact: ContactInfo;
}

const ContactSection = ({ contact }: ContactSectionProps) => {
  const contactItems = [
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: Phone, label: "Điện thoại", value: contact.phone },
    { icon: MapPin, label: "Địa chỉ", value: contact.address },
  ].filter((item) => item.value);

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: contact.facebook },
    { icon: Github, label: "GitHub", href: contact.github },
  ].filter((item) => item.href);

  return (
    <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-8">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
        Thông tin liên hệ
      </h2>

      <div className="space-y-4 mb-8">
        {contactItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
              <item.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-foreground hover:text-accent transition-colors"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-foreground">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {socialLinks.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Mạng xã hội
          </h3>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-accent/10 hover:text-accent transition-all"
              >
                <link.icon className="w-4 h-4" />
                <span className="text-sm">{link.label}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ContactSection;
