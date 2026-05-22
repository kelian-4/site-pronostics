{
  description = "WinProno dev environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    devShells.${system}.default = pkgs.mkShell {
      buildInputs = with pkgs; [
        nodejs_20
        postgresql_15
        nodePackages.npm
      ];

      shellHook = ''
        echo "🚀 WinProno dev environment"
        echo "Node: $(node --version)"
        echo "PostgreSQL: $(psql --version)"
      '';
    };
  };
}
