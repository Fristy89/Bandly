-- Extends Artist DNA with a brand color palette, reasoned in the same
-- generation call as the bios (not a separate, disconnected AI guess) so
-- it's grounded in the same identity context. Consumed by the Sites
-- module's LogoService to keep a band's signature logo color consistent
-- with their DNA rather than picked independently.

alter table artist_dna_versions
    add column primary_color varchar(7),
    add column secondary_color varchar(7);
